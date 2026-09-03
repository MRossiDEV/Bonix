from pathlib import Path
data = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx').read_bytes()
idx = data.find(b'My Block')
# Print only bytes that are ASCII printable; use repr-like escape via bytes
chunk = data[idx-30:idx+250]
print('hex:', chunk.hex())
