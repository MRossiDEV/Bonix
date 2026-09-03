from pathlib import Path
p = Path(r'D:\DEV\bonix\app\admin\[adminID]\studio\page.tsx')
s = p.read_text(encoding='utf-8')

old_state = (
    '  const liveAssets = useStudioAssets();\n'
    '  const [assets, setAssets] = useState<Asset[]>(\n'
    '    liveAssets.length > 0 ? liveAssets : initialAssets,\n'
    '  );\n'
)
new_state = (
    '  const liveAssets = useStudioAssets();\n'
    '  const [assets, setAssets] = useState<Asset[]>(\n'
    '    liveAssets.length > 0\n'
    '      ? (liveAssets as unknown as Asset[])\n'
    '      : initialAssets,\n'
    '  );\n'
)
assert old_state in s, 'state anchor not found'
s = s.replace(old_state, new_state, 1)

p.write_text(s, encoding='utf-8')
print('OK')
