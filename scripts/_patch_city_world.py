import re
from pathlib import Path

p = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx')
s = p.read_text(encoding='utf-8')

# Use regex to find the BonixWorld block + its closing parent</div>.
# Tolerant of CRLF/LF and exact indent depth.
pattern = re.compile(
    r'(<BonixWorld\s*\r?\n'
    r'\s+onSelectBuilding=\{\(building\) =>\s*\r?\n'
    r'\s+setSelectedBuildingId\(\(current\) =>\s*\r?\n'
    r'\s+current === building\.id \? null : building\.id,\s*\r?\n'
    r'\s+\)\s*\r?\n'
    r'\s+\}\s*\r?\n'
    r'\s+onBackgroundTap=\{handleClearSelection\}\s*\r?\n'
    r')\s*/>([\s\S]{0,200}?)</div>'
)

m = pattern.search(s)
assert m, 'world anchor not found'

addition = (
    '              onSelectEmptySlot={handlePlaceInEmptySlot}\r\n'
    '              highlightEmptySlots={placementStatus.kind === "placing"}\r\n'
    '            />'
)

s = s[:m.start(2)] + addition + s[m.start(2):]

p.write_text(s, encoding='utf-8')
print('OK')
