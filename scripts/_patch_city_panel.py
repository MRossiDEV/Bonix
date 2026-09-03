from pathlib import Path
import re

p = Path(r'D:\DEV\bonix\app\user\[userId]\city\page.tsx')
s = p.read_text(encoding='utf-8')

# 1) Replace the emoji bubble background + emoji source for selected
#    building with live branding color + describeBuilding() emoji.
old_emoji = (
    '<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-2xl">\n'
    '              {selectedBuilding.emoji}\n'
)
new_emoji = (
    '<div\n'
    '              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"\n'
    '              style={{\n'
    '                backgroundColor: `${selectedBuilding.branding.primaryColor}1A`,\n'
    '              }}\n'
    '            >\n'
    '              {describeBuilding(selectedBuilding).emoji}\n'
)
assert old_emoji in s, 'emoji anchor not found'
s = s.replace(old_emoji, new_emoji, 1)

# 2) Replace merchant name source
old_name = (
    '<p className="truncate text-sm font-bold text-[#F8FAFC]">\n'
    '                {selectedBuilding.name}\n'
)
new_name = (
    '<p className="truncate text-sm font-bold text-[#F8FAFC]">\n'
    '                {selectedBuilding.merchantName}\n'
)
assert old_name in s, 'name anchor not found'
s = s.replace(old_name, new_name, 1)

# 3) Replace category + level
old_cat = (
    '<p className="mt-0.5 text-[10px] text-[#64748B]">\n'
    '                {selectedBuilding.category} · Level {selectedBuilding.level}\n'
)
new_cat = (
    '<p className="mt-0.5 text-[10px] text-[#64748B]">\n'
    '                {describeBuilding(selectedBuilding).category} · Level{" "}\n'
    '                {selectedBuilding.level}\n'
)
assert old_cat in s, 'category anchor not found'
s = s.replace(old_cat, new_cat, 1)

# 4) Replace the promo chip with live-data styling
old_chip = (
    '{selectedBuilding.hasPromo ? (\n'
    '              <div className="rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-[9px] font-black text-[#22C55E]">\n'
    '                {selectedBuilding.promoLabel}\n'
)
new_chip = (
    '{selectedBuilding.hasPromo || selectedBuilding.isLivePromo ? (\n'
    '              <div\n'
    '                className="rounded-full px-2.5 py-1 text-[9px] font-black"\n'
    '                style={{\n'
    '                  backgroundColor: `${selectedBuilding.branding.primaryColor}1A`,\n'
    '                  color: selectedBuilding.branding.primaryColor,\n'
    '                }}\n'
    '              >\n'
    '                {selectedBuilding.effectivePromoLabel ?? "Promo"}\n'
)
assert old_chip in s, 'chip anchor not found'
s = s.replace(old_chip, new_chip, 1)

p.write_text(s, encoding='utf-8')
print('OK')
