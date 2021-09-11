# Journal

This journal's aim is to present and describe the strategies and decisions chosen for this project.

## Choosing the product

After thinking about it for a while, we decided that **ACME** has asked us to configure their e-commerce site in order to sell their sofas.

## Giving some context

We are going to build a website with a classic **homepage** and a **showcase** menu that allows the user to interact with the scene by orbitating around the sofa and choosing models and textures.

## Building the website

In order to implement the website's home page and the showcase we used tools from different sources: 

- [JQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/) (MIT License)
- [Bootstrap Icons](https://icons.getbootstrap.com/) (MIT License)
- [Unsplash](https://unsplash.com/) (for pictures of sofas), credits to:
  + Paul Weather
  + Hutomo Abrianto
  + Sven Brandsma
  + Kari Shea

## Object model

As our main sofa we decided to use a cool one we found [here](https://www.cgtrader.com/free-3d-models/furniture/sofa/couch-williams-302) under a **royalty free license** on the [CGTrader](https://www.cgtrader.com/) website.  

## Textures

All the textures used have been downloaded from [ambientCG](https://ambientcg.com/), which is a website that provides public domain licensed materials for physically based rendering. 

## Environment Map

As requested, we added an environment map to our showcase. Particularly, we used a 360 map that we converted to a **cube map**, downloaded from the [Poly Haven](https://polyhaven.com/a/studio_country_hall) website under a [CC0](https://wiki.creativecommons.org/wiki/CC0_FAQ) (public domain) license.

## Choosing the shaders

First of all, we based our shading work on the fragment shader of the `l15-shadingWithTextures.html` code. While searching online, we found about Google's [Filament](https://google.github.io/filament/Filament.html), a PBR enginge for Android whose goal is to offer tools for high quality 3D render with ease. On it's website, developers accurately present some of the Math behind Filament and the **BRDF**s equations used for specific surfaces. 

We found out about the [Cloth model](https://google.github.io/filament/Filament.html#materialsystem/clothmodel), whose aim is to represent loosely connected threads that absorb and scatter incident light (for example, a couch). The cloth **specular BRDF** is a modified microfaced BRDF, while the cloth **diffuse BRDF** is a slight modification of a Lambertian diffuse BRDF.

The full **cloth model implementation** is the following:

```c++
// specular BRDF
float D = distributionCloth(roughness, NoH);
float V = visibilityCloth(NoV, NoL);
vec3  F = sheenColor;
vec3 Fr = (D * V) * F;

// diffuse BRDF
float diffuse = diffuse(roughness, NoV, NoL, LoH);
#if defined(MATERIAL_HAS_SUBSURFACE_COLOR)
// energy conservative wrap diffuse
diffuse *= saturate((dot(n, light.l) + 0.5) / 2.25);
#endif
vec3 Fd = diffuse * pixel.diffuseColor;

#if defined(MATERIAL_HAS_SUBSURFACE_COLOR)
// cheap subsurface scatter
Fd *= saturate(subsurfaceColor + NoL);
vec3 color = Fd + Fr * NoL;
color *= (lightIntensity * lightAttenuation) * lightColor;
#else
vec3 color = Fd + Fr;
color *= (lightIntensity * lightAttenuation * NoL) * lightColor;
#endif
```

We were able to integrate this code in our fragment shaders, that also involves multiple lightning, environment map and texture usage.

## Lightning

In order to add proper lightning to our scene we decided to include four **point lights** that enlight the couch's surface from four different angles. This allows the viewer to always look at a fully illuminated sofa since he will be able to orbitate around it inside the scene.
