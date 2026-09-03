import re
from pathlib import Path
p = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx')
s = p.read_bytes().decode('utf-8')

# Insert the XP span right after the closing</span> for "My Block".
# Match the entire "My Block" span and the trailing</div>.
pattern = re.compile(
    r'(<span className="text-xs font-semibold text-\[#22C55E\]">\s*\r?\n'
    r'\s+My Block\s*\r?\n'
    r'\s+</span>\s*\r?\n'
    r')(\s*</div>)'
)
m = pattern.search(s)
assert m, 'level span not found'

addition = (
    '              <span className="text-[10px] font-bold text-[#94A3B8]">\r\n'
    '                · {progression.points} XP\r\n'
    '            </span>\r\n'
)
s = s[:m.start(2)] + addition + s[m.start(2):]

p.write_bytes(s.encode('utf-8'))
print('OK')
