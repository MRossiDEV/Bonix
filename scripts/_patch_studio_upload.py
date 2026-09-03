from pathlib import Path
p = Path(r'D:\DEV\bonix\app\admin\[adminID]\studio\page.tsx')
s = p.read_text(encoding='utf-8')

# Slice from the dashed-border div to the closing</div> that ends
# the upload placeholder (right before the next grid div).
import re

pattern = re.compile(
    r'          <div className="rounded-2xl border border-dashed border-\[#334155\] bg-\[#0B0F14\] p-8 text-center">.*</div>\n',
    re.DOTALL,
)
m = pattern.search(s)
assert m, 'box anchor not found'
new_block = '          <AssetUploader onUploaded={() => setShowUpload(false)} />\n'
s = s[:m.start()] + new_block + s[m.end():]

# Add the AssetUploader import + useStudioAssets hook near the top.
old_import_block = (
    'const AssetPreview = dynamic(\n'
    '  () =>\n'
    '    import("@/components/3d/assets/AssetPreview").then(\n'
    '      (mod) => mod.AssetPreview,\n'
    '    ),\n'
    '  {\n'
    '    ssr: false,\n'
    '    loading: () => (\n'
    '      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#64748B]">\n'
    '        Loading 3D…\n'
    '  </div>\n'
    '    ),\n'
    '  },\n'
    ');'
)
new_import_block = (
    'const AssetPreview = dynamic(\n'
    '  () =>\n'
    '    import("@/components/3d/assets/AssetPreview").then(\n'
    '      (mod) => mod.AssetPreview,\n'
    '    ),\n'
    '  {\n'
    '    ssr: false,\n'
    '    loading: () => (\n'
    '      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#64748B]">\n'
    '        Loading 3D…\n'
    '  </div>\n'
    '    ),\n'
    '  },\n'
    ');\n'
    '\n'
    'import { AssetUploader } from "@/components/3d/admin/AssetUploader";\n'
    'import { useStudioAssets } from "@/lib/3d/use-studio-assets";'
)
assert old_import_block in s, 'import block anchor not found'
s = s.replace(old_import_block, new_import_block, 1)

p.write_text(s, encoding='utf-8')
print('OK')
