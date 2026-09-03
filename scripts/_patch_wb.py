from pathlib import Path
p = Path(r'D:\DEV\bonix\components\3d\buildings\WorldBuilding.tsx')
s = p.read_text(encoding='utf-8')

old_imports = (
'import { useMemo } from "react";\n'
'import { AssetInstance } from "@/components/3d/assets/AssetInstance";\n'
'import { PromoIndicator } from "@/components/3d/buildings/BuildingEffects";\n'
'import { MOCK_ASSETS } from "@/lib/3d/mockWorld";\n'
'import type { ResolvedBuilding } from "@/types/3d";\n'
)
new_imports = (
'import { useMemo } from "react";\n'
'import { AssetInstance } from "@/components/3d/assets/AssetInstance";\n'
'import { BuildingBranding } from "@/components/3d/buildings/BuildingBranding";\n'
'import { BuildingPromoState } from "@/components/3d/buildings/BuildingPromoState";\n'
'import { MOCK_ASSETS } from "@/lib/3d/mockWorld";\n'
'import { useMerchantBranding } from "@/lib/3d/use-merchant-branding";\n'
'import type { ResolvedBuilding } from "@/types/3d";\n'
)
assert old_imports in s, 'imports anchor not found'
s = s.replace(old_imports, new_imports, 1)

# Replace the inline PromoIndicator with BuildingPromoState + add BuildingBranding
old_body = (
'      <AssetInstance\n'
'        asset={asset}\n'
'        position={[0, 0, 0]}\n'
'        scale={1}\n'
'        primaryColor={building.primaryColor}\n'
'        secondaryColor={building.secondaryColor}\n'
'        emissive={emissive}\n'
'        emissiveIntensity={showPromo ? 0.35 : 0.1}\n'
'      />\n'
'\n'
'      <PromoIndicator\n'
'        position={position}\n'
'        active={showPromo || building.buildingState === "RESERVED"}\n'
'        label={building.promoLabel ?? "BONIX"}\n'
'        intensity={ringIntensity}\n'
'        color={\n'
'          building.buildingState === "RESERVED" ? "#3B82F6" : "#22C55E"\n'
'        }\n'
'      />\n'
)
new_body = (
'      <AssetInstance\n'
'        asset={asset}\n'
'        position={[0, 0, 0]}\n'
'        scale={1}\n'
'        primaryColor={effectivePrimaryColor}\n'
'        secondaryColor={effectiveSecondaryColor}\n'
'        emissive={emissive}\n'
'        emissiveIntensity={showPromo ? 0.35 : 0.1}\n'
'      />\n'
'\n'
'      <BuildingBranding\n'
'        position={position}\n'
'        logoUrl={branding?.logoUrl ?? null}\n'
'        signText={branding?.signText ?? building.signText ?? null}\n'
'        primaryColor={effectivePrimaryColor}\n'
'      />\n'
'\n'
'      <BuildingPromoState\n'
'        position={position}\n'
'        buildingState={building.buildingState}\n'
'        promoLabel={building.promoLabel}\n'
'      />\n'
)
assert old_body in s, 'body anchor not found'
s = s.replace(old_body, new_body, 1)

# Add the branding hook + effective color resolution before the return.
old_pre_return = (
'  const ringIntensity = PROMO_INTENSITY[building.buildingState] ?? 0;\n'
'\n'
'  const emissive = useMemo(() => {\n'
)
new_pre_return = (
'  const ringIntensity = PROMO_INTENSITY[building.buildingState] ?? 0;\n'
'\n'
'  const branding = useMerchantBranding(building.merchantId);\n'
'\n'
'  const effectivePrimaryColor =\n'
'    branding?.primaryColor ?? building.primaryColor ?? "#22C55E";\n'
'  const effectiveSecondaryColor =\n'
'    branding?.secondaryColor ?? building.secondaryColor ?? "#F8FAFC";\n'
'\n'
'  const emissive = useMemo(() => {\n'
)
assert old_pre_return in s, 'pre-return anchor not found'
s = s.replace(old_pre_return, new_pre_return, 1)

p.write_text(s, encoding='utf-8')
print('OK')
