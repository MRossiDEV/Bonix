data = open(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx','rb').read()
target = b'</div>\r\n'
idx = data.find(b'            />\r\n')
end_idx = data.find(target, idx)
print('leading bytes before </div>:', repr(data[end_idx-12:end_idx+10].decode('utf-8')))
