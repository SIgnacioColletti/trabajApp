/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("service_categories", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("name").notNullable(); // Plomería, Electricidad, etc.
      table.string("slug").unique().notNullable(); // plomeria, electricidad, etc.
      table.text("description");
      table.string("icon_url");
      table.string("color_hex").defaultTo("#007AFF");
      table.boolean("is_active").defaultTo(true);
      table.integer("sort_order").defaultTo(0);
      table.timestamps(true, true);

      table.index(["slug"]);
      table.index(["is_active"]);
    })
    .createTable("services", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("category_id")
        .references("id")
        .inTable("service_categories")
        .onDelete("CASCADE");
      table.string("name").notNullable(); // Reparación de cañería, Instalación eléctrica, etc.
      table.string("slug").notNullable();
      table.text("description");
      table.decimal("base_price", 10, 2); // Precio base sugerido
      table.string("price_unit").defaultTo("servicio"); // servicio, hora, m2, etc.
      table.boolean("is_emergency").defaultTo(false); // Si acepta emergencias
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);

      table.unique(["category_id", "slug"]);
      table.index(["category_id"]);
      table.index(["is_emergency"]);
      table.index(["is_active"]);
    })
    .createTable("professional_profiles", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.text("bio"); // Descripción del profesional
      table.integer("experience_years").defaultTo(0);
      table.jsonb("certifications").defaultTo("[]"); // Certificaciones y títulos
      table.decimal("hourly_rate", 8, 2); // Tarifa por hora base
      table.integer("work_radius_km").defaultTo(10); // Radio de trabajo en km
      table.jsonb("work_schedule").defaultTo("{}"); // Horarios de trabajo por día
      table.boolean("accepts_emergencies").defaultTo(false);
      table.decimal("emergency_rate_multiplier", 3, 2).defaultTo(1.5); // Multiplicador para emergencias
      table.boolean("has_vehicle").defaultTo(false);
      table.boolean("has_tools").defaultTo(false);
      table.string("document_type").defaultTo("DNI"); // DNI, CUIT, etc.
      table.string("document_number");
      table.string("document_image_url"); // Foto del documento
      table
        .enum("verification_status", ["pending", "verified", "rejected"])
        .defaultTo("pending");
      table.text("rejection_reason");
      table.timestamp("verified_at");
      table.boolean("is_available").defaultTo(true); // Si está disponible para trabajos
      table.enum("subscription_type", ["free", "premium"]).defaultTo("free");
      table.timestamp("subscription_expires_at");
      table.timestamps(true, true);

      table.unique(["user_id"]);
      table.unique(["document_number"]);
      table.index(["verification_status"]);
      table.index(["is_available"]);
      table.index(["subscription_type"]);
      table.index(["work_radius_km"]);
    })
    .createTable("professional_services", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professional_profiles")
        .onDelete("CASCADE");
      table
        .uuid("service_id")
        .references("id")
        .inTable("services")
        .onDelete("CASCADE");
      table.decimal("custom_price", 10, 2); // Precio personalizado del profesional
      table.string("price_unit").defaultTo("servicio");
      table.text("description"); // Descripción específica del profesional para este servicio
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);

      table.unique(["professional_id", "service_id"]);
      table.index(["professional_id"]);
      table.index(["service_id"]);
      table.index(["is_active"]);
    })
    .createTable("professional_portfolio", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("professional_id")
        .references("id")
        .inTable("professional_profiles")
        .onDelete("CASCADE");
      table.string("title").notNullable();
      table.text("description");
      table.string("image_url").notNullable();
      table.uuid("service_id").references("id").inTable("services");
      table.date("completed_date");
      table.integer("sort_order").defaultTo(0);
      table.boolean("is_featured").defaultTo(false);
      table.timestamps(true, true);

      table.index(["professional_id"]);
      table.index(["service_id"]);
      table.index(["is_featured"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("professional_portfolio")
    .dropTableIfExists("professional_services")
    .dropTableIfExists("professional_profiles")
    .dropTableIfExists("services")
    .dropTableIfExists("service_categories");
};
