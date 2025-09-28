#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# ↓↓↓ 新增三行：让 .env 生效 ↓↓↓
try:
    from dotenv import load_dotenv  # 自创导入：从 .env 文件加载环境变量
    load_dotenv()
except Exception:
    pass
# ↑↑↑ 新增结束 ↑↑↑

def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
