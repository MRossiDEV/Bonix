from pathlib import Path
p = Path(r'D:\DEV\bonix\app\admin\[adminID]\studio\page.tsx')
s = p.read_text(encoding='utf-8')

# Insert the new imports after the AssetPreview dynamic-import
# closing `);` block. The line is: `);` followed by a blank line
# followed by `type AssetType = ...`.
import re
m = re.search(r'const AssetPreview = dynamic\(\n.*?\n\);\n', s, re.DOTALL)
assert m, 'asset preview block not found'
insert_pos = m.end()
addition = (
    '\n'
    'import { AssetUploader } from "@/components/3d/admin/AssetUploader";\n'
    'import { useStudioAssets } from "@/lib/3d/use-studio-assets";\n'
)
s = s[:insert_pos] + addition + s[insert_pos:]

p.write_text(s, encoding='utf-8')
print('OK')
