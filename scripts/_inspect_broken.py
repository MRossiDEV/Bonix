from pathlib import Path
data = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx').read_bytes()
idx = data.find(b'onBackgroundTap')
print(repr(data[idx:idx+250].decode('utf-8')))
