from __future__ import annotations

import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Tuple

from django.conf import settings
from django.core.management.base import BaseCommand, CommandParser


class Command(BaseCommand):
    help = (
        "Remove diretórios de pacotes antigos em MEDIA_ROOT/packages. "
        "Permite manter apenas os mais recentes e/ou remover por idade."
    )

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--older-than-days",
            type=int,
            default=None,
            help="Remove pacotes com última modificação anterior a N dias.",
        )
        parser.add_argument(
            "--keep-latest",
            type=int,
            default=None,
            help="Mantém apenas os N pacotes mais recentes; remove o resto.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Apenas lista o que seria removido sem apagar nada.",
        )
        parser.add_argument(
            "--yes",
            action="store_true",
            help="Confirmação não interativa (não pergunta antes de remover).",
        )

    def handle(self, *args, **options):
        base_dir = Path(settings.MEDIA_ROOT) / "packages"
        if not base_dir.exists():
            self.stdout.write(self.style.WARNING(f"Diretório inexistente: {base_dir}"))
            return

        packages = self._list_packages_with_mtime(base_dir)
        if not packages:
            self.stdout.write(self.style.SUCCESS("Nenhum pacote encontrado para limpar."))
            return

        # Ordena por mtime desc (mais recentes primeiro)
        packages.sort(key=lambda it: it[1], reverse=True)

        to_remove: List[Path] = []

        # Regra keep-latest
        keep_latest = options.get("keep-latest")
        if keep_latest is not None and keep_latest >= 0:
            to_remove.extend([p for (p, _mt) in packages[keep_latest:]])

        # Regra older-than-days
        older_than_days = options.get("older-than-days")
        if older_than_days is not None and older_than_days >= 0:
            cutoff = datetime.now().astimezone() - timedelta(days=older_than_days)
            for p, mtime in packages:
                if mtime < cutoff and p not in to_remove:
                    to_remove.append(p)

        # Dedup e ordena por mtime asc só para leitura mais agradável
        unique_remove = []
        seen = set()
        for p in to_remove:
            if p not in seen:
                seen.add(p)
                unique_remove.append(p)

        if not unique_remove:
            self.stdout.write(self.style.SUCCESS("Nada para remover com os critérios fornecidos."))
            return

        self.stdout.write("Pacotes a remover:")
        for p in unique_remove:
            self.stdout.write(f" - {p}")

        if options.get("dry-run"):
            self.stdout.write(self.style.SUCCESS("Dry-run: nenhuma alteração realizada."))
            return

        if not options.get("yes"):
            self.stdout.write("")
            self.stdout.write("Confirma a remoção? [y/N]: ", ending="")
            try:
                choice = input().strip().lower()
            except EOFError:
                choice = "n"
            if choice not in {"y", "yes"}:
                self.stdout.write(self.style.WARNING("Operação cancelada pelo usuário."))
                return

        errors = 0
        for p in unique_remove:
            try:
                shutil.rmtree(p, ignore_errors=False)
            except Exception as exc:
                errors += 1
                self.stderr.write(self.style.ERROR(f"Falha ao remover {p}: {exc}"))

        if errors:
            self.stdout.write(self.style.WARNING(f"Concluído com {errors} erro(s)."))
        else:
            self.stdout.write(self.style.SUCCESS("Limpeza concluída sem erros."))

    def _list_packages_with_mtime(self, base_dir: Path) -> List[Tuple[Path, datetime]]:
        results: List[Tuple[Path, datetime]] = []
        for child in base_dir.iterdir():
            if not child.is_dir():
                continue
            # Determina o mtime mais recente dentro do diretório
            mtime = None
            for sub in child.rglob("*"):
                try:
                    ts = sub.stat().st_mtime
                except OSError:
                    continue
                dt = datetime.fromtimestamp(ts).astimezone()
                if mtime is None or dt > mtime:
                    mtime = dt
            if mtime is None:
                # fallback para mtime do próprio diretório
                try:
                    dt = datetime.fromtimestamp(child.stat().st_mtime).astimezone()
                except OSError:
                    continue
                mtime = dt
            results.append((child, mtime))
        return results
