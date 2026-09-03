from pathlib import Path
p = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx')
s = p.read_bytes().decode('utf-8')

broken = (
    '              onBackgroundTap={handleClearSelection}\r\n'
    '            />              onSelectEmptySlot={handlePlaceInEmptySlot}\r\r\n'
    '              highlightEmptySlots={placementStatus.kind === "placing"}\r\r\n'
    '            />'
)
fixed = (
    '              onBackgroundTap={handleClearSelection}\r\n'
    '              onSelectEmptySlot={handlePlaceInEmptySlot}\r\n'
    '              highlightEmptySlots={placementStatus.kind === "placing"}\r\n'
    '            />'
)
assert broken in s, 'broken anchor not found'
s = s.replace(broken, fixed, 1)

p.write_bytes(s.encode('utf-8'))
print('OK')
