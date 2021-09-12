# Product Configuration

This repository constains the project developed by Francesco Bombassei De Bona and Andrea Cantarutti (A.A. 2020/2021) and based on the second assignment of the Interactive 3D Graphics course.

## Description

The project consist of a web application that simulates an e-commerce website and provides a **web-visualizer** in order to let the user configure the product according to his preferences. 

We decided to base our work on a company that sells **Sofas**. The homepage gives a brief presentation of **ACME** and the showcase page provides a threejs scene in which the user is able to inspect the product from every angle. A **menu button** allows to user to switch materials for different components.

Of course, the web application doesn't aim to implement a fully functional e-commerce website, but to give some context to the product visualizer in order to test how it would fit in a **real-life context**. 

## Repository structure

All the work can be found inside the `website` directory. This contains: 

- `cubmap` (directory that contains the Environment Map used)
- `images` (directory that contains all the images used within the website)
- `libs` (directory that contains all the library used)
- `materials` (directory that contains all the textures used)
- `obj` (directory that contains the object model used)
- `style.css` (stylesheet file used within the website)
- `header.html` (navbar for the website pages)
- `index.html` (website's landing page)
- `showcase.html` (website's page that provides the product configurator)
- `showcase.js` (threejs code that implements the product configurator)

In the main folder you can also find: 

- The original assignment (`assignment.md`)
- The journal we kept while working on the project (`journal.md`)
- The medias used for this report (inside `media` folder)

## Object and Textures

Since we decided to work on a sofa company, we searched for a well-made 3D model of a couch. We decided to use [this one](https://www.cgtrader.com/free-3d-models/furniture/sofa/couch-williams-302), which is under a **royalty free license** as the [CGTrader](https://www.cgtrader.com/) website states. 

