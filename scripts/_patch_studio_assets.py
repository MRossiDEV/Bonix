from pathlib import Path
p = Path(r'D:\DEV\bonix\app\admin\[adminID]\studio\page.tsx')
s = p.read_text(encoding='utf-8')

# Replace the asset state initialization so it uses the Supabase
# query and falls back to the mock data when nothing is returned.
old_state = 'const [assets, setAssets] = useState<Asset[]>(initialAssets);'
new_state = (
    'const liveAssets = useStudioAssets();\n'
    'const [assets, setAssets] = useState<Asset[]>(\n'
    '  liveAssets.length > 0 ? liveAssets : initialAssets,\n'
    ');'
)
# The state init uses two separate lines in the file. Replace just
# the source of truth and keep setAssets in case future uploads
# append locally.
old_state2 = '  const [assets, setAssets] = useState<Asset[]>(initialAssets);\n'
new_state2 = (
    '  const liveAssets = useStudioAssets();\n'
    '  const [assets, setAssets] = useState<Asset[]>(\n'
    '    liveAssets.length > 0 ? liveAssets : initialAssets,\n'
    '  );\n'
)
assert old_state2 in s, 'asset state anchor not found'
s = s.replace(old_state2, new_state2, 1)

p.write_text(s, encoding='utf-8')
print('OK')
