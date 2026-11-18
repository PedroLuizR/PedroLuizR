# 3D model pipeline (Bento)

Turns the source model (`Patient_Pup_Dog.glb`, ~25 MB, not committed) into the
app assets in `assets/models/`.

```bash
npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
node optimize.mjs Patient_Pup_Dog.glb bento.glb 0.15   # ~268k → ~40k triangles, 1024px JPEG, drops flat maps
node bake.mjs bento.glb bento_outfits.glb             # adds fitted outfits + collar band, writes bento_outfits_color.jpg
node vcolor.mjs bento_outfits.glb color2048.png ../../assets/models/bento3d.glb  # fur color baked into vertices (no textures)
node collar.mjs coleira_rastreador.glb ../../assets/models/collar3d.glb          # collar: textures -> average colors
```

The app loads **no textures**: uploading images through expo-gl was unreliable on
Android (the dog rendered black), so colors live in vertices / material factors.
The collar's `Logo_Decal` emblem (on the `Rastreador` node) is the slot for a logo;
a logo should be added as extruded geometry from an official SVG.

`bake.mjs` builds each outfit as a shell of the dog's own surface (region chosen
by planes along the torso/neck), pushed outward from the body axis, smoothed with
Taubin smoothing and sunk into the fur near the hem so the edge is clean.
Node names in the output: `dog`, `outfit_moletom(_hood)`, `outfit_capa(_hood)`,
`outfit_bandana`, `collar`, `collar_device_anchor`.
