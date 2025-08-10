/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Limpiar tablas existentes
  await knex("professional_services").del();
  await knex("services").del();
  await knex("service_categories").del();

  // Insertar categorías de servicios
  const categories = [
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Plomería",
      slug: "plomeria",
      description:
        "Instalación, reparación y mantenimiento de sistemas de agua y desagües",
      icon_url: "https://cdn.trabajapp.com/icons/plomeria.svg",
      color_hex: "#4A90E2",
      sort_order: 1,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Electricidad",
      slug: "electricidad",
      description: "Instalaciones eléctricas, reparaciones y mantenimiento",
      icon_url: "https://cdn.trabajapp.com/icons/electricidad.svg",
      color_hex: "#F5A623",
      sort_order: 2,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Pintura",
      slug: "pintura",
      description: "Pintura de interiores, exteriores y trabajos decorativos",
      icon_url: "https://cdn.trabajapp.com/icons/pintura.svg",
      color_hex: "#7ED321",
      sort_order: 3,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Albañilería",
      slug: "albanileria",
      description: "Construcción, remodelación y trabajos de mampostería",
      icon_url: "https://cdn.trabajapp.com/icons/albanileria.svg",
      color_hex: "#D0021B",
      sort_order: 4,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Gasfitería",
      slug: "gasfiteria",
      description: "Instalación y reparación de sistemas de gas",
      icon_url: "https://cdn.trabajapp.com/icons/gasfiteria.svg",
      color_hex: "#BD10E0",
      sort_order: 5,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      name: "Carpintería",
      slug: "carpinteria",
      description: "Muebles a medida, reparaciones y trabajos en madera",
      icon_url: "https://cdn.trabajapp.com/icons/carpinteria.svg",
      color_hex: "#8B572A",
      sort_order: 6,
    },
  ];

  const insertedCategories = await knex("service_categories")
    .insert(categories)
    .returning(["id", "slug"]);

  // Crear mapeo de slug a ID para referencias
  const categoryMap = {};
  const categoryResults = await knex("service_categories").select("id", "slug");
  categoryResults.forEach((cat) => {
    categoryMap[cat.slug] = cat.id;
  });

  // Insertar servicios por categoría
  const services = [
    // Plomería
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["plomeria"],
      name: "Reparación de cañerías",
      slug: "reparacion-canerias",
      description: "Reparación de roturas, fugas y obstrucciones en cañerías",
      base_price: 2500,
      price_unit: "servicio",
      is_emergency: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["plomeria"],
      name: "Instalación de grifería",
      slug: "instalacion-griferia",
      description: "Instalación y cambio de canillas, grifos y accesorios",
      base_price: 1800,
      price_unit: "punto",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["plomeria"],
      name: "Destapación de cloacas",
      slug: "destapacion-cloacas",
      description: "Destapación de desagües, cloacas y cañerías obstruidas",
      base_price: 3200,
      price_unit: "servicio",
      is_emergency: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["plomeria"],
      name: "Instalación de termotanque",
      slug: "instalacion-termotanque",
      description: "Instalación completa de termotanques eléctricos y a gas",
      base_price: 4500,
      price_unit: "servicio",
      is_emergency: false,
    },

    // Electricidad
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["electricidad"],
      name: "Instalación de tomacorrientes",
      slug: "instalacion-tomacorrientes",
      description: "Instalación de tomacorrientes, enchufes y puntos de luz",
      base_price: 1200,
      price_unit: "punto",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["electricidad"],
      name: "Reparación de cortocircuitos",
      slug: "reparacion-cortocircuitos",
      description: "Diagnóstico y reparación de problemas eléctricos",
      base_price: 2800,
      price_unit: "servicio",
      is_emergency: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["electricidad"],
      name: "Instalación de ventiladores",
      slug: "instalacion-ventiladores",
      description: "Instalación de ventiladores de techo y de pared",
      base_price: 1500,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["electricidad"],
      name: "Cambio de tablero eléctrico",
      slug: "cambio-tablero-electrico",
      description: "Actualización y cambio de tableros eléctricos",
      base_price: 8500,
      price_unit: "servicio",
      is_emergency: false,
    },

    // Pintura
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["pintura"],
      name: "Pintura de interiores",
      slug: "pintura-interiores",
      description: "Pintura completa de ambientes interiores",
      base_price: 800,
      price_unit: "m2",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["pintura"],
      name: "Pintura de exteriores",
      slug: "pintura-exteriores",
      description: "Pintura de fachadas, muros externos y frentes",
      base_price: 1200,
      price_unit: "m2",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["pintura"],
      name: "Pintura decorativa",
      slug: "pintura-decorativa",
      description: "Técnicas especiales, murales y efectos decorativos",
      base_price: 1800,
      price_unit: "m2",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["pintura"],
      name: "Reparación de humedad",
      slug: "reparacion-humedad",
      description: "Tratamiento de humedades y preparación de superficies",
      base_price: 2200,
      price_unit: "m2",
      is_emergency: false,
    },

    // Albañilería
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["albanileria"],
      name: "Construcción de muros",
      slug: "construccion-muros",
      description: "Construcción de paredes, tabiques y muros divisorios",
      base_price: 3500,
      price_unit: "m2",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["albanileria"],
      name: "Colocación de cerámicos",
      slug: "colocacion-ceramicos",
      description: "Colocación de cerámicos, porcelanatos y revestimientos",
      base_price: 1800,
      price_unit: "m2",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["albanileria"],
      name: "Reparación de techos",
      slug: "reparacion-techos",
      description: "Reparación de goteras, membranas y techos",
      base_price: 4200,
      price_unit: "servicio",
      is_emergency: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["albanileria"],
      name: "Demolición",
      slug: "demolicion",
      description: "Demolición parcial de muros, pisos y estructuras",
      base_price: 2800,
      price_unit: "m2",
      is_emergency: false,
    },

    // Gasfitería
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["gasfiteria"],
      name: "Instalación de cocinas",
      slug: "instalacion-cocinas",
      description: "Instalación y conexión de cocinas y hornos a gas",
      base_price: 3500,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["gasfiteria"],
      name: "Reparación de pérdidas de gas",
      slug: "reparacion-perdidas-gas",
      description: "Detección y reparación de fugas de gas",
      base_price: 4500,
      price_unit: "servicio",
      is_emergency: true,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["gasfiteria"],
      name: "Instalación de calefones",
      slug: "instalacion-calefones",
      description: "Instalación de calefones y sistemas de agua caliente",
      base_price: 5200,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["gasfiteria"],
      name: "Certificación de gas",
      slug: "certificacion-gas",
      description: "Certificación de instalaciones de gas para habilitación",
      base_price: 6500,
      price_unit: "servicio",
      is_emergency: false,
    },

    // Carpintería
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["carpinteria"],
      name: "Muebles a medida",
      slug: "muebles-medida",
      description: "Diseño y fabricación de muebles personalizados",
      base_price: 15000,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["carpinteria"],
      name: "Instalación de puertas",
      slug: "instalacion-puertas",
      description: "Instalación y cambio de puertas interiores y exteriores",
      base_price: 4200,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["carpinteria"],
      name: "Reparación de muebles",
      slug: "reparacion-muebles",
      description: "Restauración y reparación de muebles de madera",
      base_price: 2800,
      price_unit: "servicio",
      is_emergency: false,
    },
    {
      id: knex.raw("gen_random_uuid()"),
      category_id: categoryMap["carpinteria"],
      name: "Colocación de pisos",
      slug: "colocacion-pisos",
      description: "Instalación de pisos de madera, laminados y flotantes",
      base_price: 3200,
      price_unit: "m2",
      is_emergency: false,
    },
  ];

  await knex("services").insert(services);

  console.log("✅ Datos iniciales insertados exitosamente:");
  console.log(`   - ${categories.length} categorías de servicios`);
  console.log(`   - ${services.length} servicios`);
  console.log("   - Plomería: 4 servicios (2 de emergencia)");
  console.log("   - Electricidad: 4 servicios (1 de emergencia)");
  console.log("   - Pintura: 4 servicios");
  console.log("   - Albañilería: 4 servicios (1 de emergencia)");
  console.log("   - Gasfitería: 4 servicios (1 de emergencia)");
  console.log("   - Carpintería: 4 servicios");
};
