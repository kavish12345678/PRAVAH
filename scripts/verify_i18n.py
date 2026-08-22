import re
from pathlib import Path

LOCALES_DIR = Path("/Users/kartikmangla/Desktop/PRAVAH/frontend/src/i18n/locales")
LOCALE_FILES = {
    "English": "en.ts",
    "Hindi": "hi.ts",
    "Tamil": "ta.ts",
    "Telugu": "te.ts",
    "Bengali": "bn.ts",
    "Marathi": "mr.ts",
}

def extract_keys(content: str) -> set:
    keys = set()
    current_section = ""
    for line in content.splitlines():
        line = line.strip()
        # check section e.g. "common: {"
        section_match = re.match(r"^(\w+):\s*\{", line)
        if section_match:
            current_section = section_match.group(1)
            continue
        if line.startswith("}"):
            continue
        key_match = re.match(r"^(\w+):", line)
        if key_match and current_section:
            keys.add(f"{current_section}.{key_match.group(1)}")
    return keys

def main():
    en_content = (LOCALES_DIR / "en.ts").read_text(encoding="utf-8")
    en_keys = extract_keys(en_content)
    print(f"==================================================")
    print(f"PRAVAH i18n Completeness Verification Report")
    print(f"==================================================")
    print(f"Total English (en.ts) Master Keys: {len(en_keys)}")
    print("--------------------------------------------------")

    all_passed = True
    for name, filename in LOCALE_FILES.items():
        if name == "English":
            continue
        content = (LOCALES_DIR / filename).read_text(encoding="utf-8")
        loc_keys = extract_keys(content)
        missing = en_keys - loc_keys
        if not missing:
            print(f"✓ {name.ljust(10)} : 0 missing keys (100% Complete - {len(loc_keys)}/{len(en_keys)})")
        else:
            print(f"✗ {name.ljust(10)} : {len(missing)} missing keys -> {missing}")
            all_passed = False

    print("--------------------------------------------------")
    if all_passed:
        print("RESULT: ALL 6 LANGUAGES HAVE 100% COMPLETE PARITY.")
    else:
        print("RESULT: Missing translations detected.")
    print("==================================================")

if __name__ == "__main__":
    main()
