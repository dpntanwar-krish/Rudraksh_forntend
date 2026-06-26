from pathlib import Path
p = Path(r'C:\Users\Hp\Desktop\RRudraksh\rudraksh\src\admin\VideoManager.jsx')
t = p.read_text(encoding='utf-8')
m = 'export default VideoManager;'
i = t.find(m)
if i != -1:
    p.write_text(t[:i+len(m)].rstrip() + '\n', encoding='utf-8')
    print('Fixed! Trimmed to', i + len(m), 'chars')
else:
    print('Marker not found')
