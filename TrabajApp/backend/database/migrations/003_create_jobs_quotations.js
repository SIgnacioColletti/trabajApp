/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("jobs", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("job_number").unique().notNullable(); // TJ-001, TJ-002, etc.
      table
        .uuid("client_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .uuid("professional_id")
        .references("id")
        .inTable("users")
        .nullable();
      table
        .uuid("service_id")
        .references("id")
        .inTable("services")
        .onDelete("RESTRICT");

      // Información del trabajo
      table.string("title").notNullable();
      table.text("description").notNullable();
      table.text("work_address").notNullable();
      table.decimal("work_latitude", 10, 8);
      table.decimal("work_longitude", 11, 8);
      table.string("work_city").defaultTo("Rosario");

      // Urgencia y fechas
      table
        .enum("urgency", ["normal", "urgent", "emergency"])
        .defaultTo("normal");
      table.timestamp("preferred_date");
      table.timestamp("preferred_time");
      table.boolean("flexible_schedule").defaultTo(true);

      // Estado del trabajo
      table
        .enum("status", [
          "draft", // Borrador (cliente aún editando)
          "pending", // Publicado, esperando cotizaciones
          "quoted", // Con cotizaciones recibidas
          "assigned", // Asignado a un profesional
          "confirmed", // Confirmado por ambas partes
          "in_progress", // En progreso
          "completed", // Completado por el profesional
          "delivered", // Entregado y aceptado por cliente
          "cancelled", // Cancelado
          "disputed", // En disputa
        ])
        .defaultTo("draft");

      // Información de precio
      table.decimal("budget_min", 10, 2);
      table.decimal("budget_max", 10, 2);
      table.decimal("final_price", 10, 2);
      table.string("price_currency").defaultTo("ARS");

      // Fechas importantes
      table.timestamp("published_at");
      table.timestamp("assigned_at");
      table.timestamp("started_at");
      table.timestamp("completed_at");
      table.timestamp("delivered_at");
      table.timestamp("cancelled_at");

      // Información adicional
      table.text("client_notes");
      table.text("professional_notes");
      table.text("cancellation_reason");
      table.jsonb("metadata").defaultTo("{}"); // Info adicional como materiales necesarios, etc.

      table.timestamps(true, true);

      // Índices para optimización
      table.index(["client_id"]);
      table.index(["professional_id"]);
      table.index(["service_id"]);
      table.index(["status"]);
      table.index(["urgency"]);
      table.index(["published_at"]);
      table.index(["work_city"]);
      table.index(["work_latitude", "work_longitude"]);
    })
    .createTable("job_images", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table.string("image_url").notNullable();
      table.string("image_type").defaultTo("problem"); // problem, reference, result
      table.string("uploaded_by_type"); // client, professional
      table.uuid("uploaded_by_id").references("id").inTable("users");
      table.text("description");
      table.integer("sort_order").defaultTo(0);
      table.timestamps(true, true);

      table.index(["job_id"]);
      table.index(["image_type"]);
      table.index(["uploaded_by_id"]);
    })
    .createTable("quotations", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("professional_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");

      // Información de la cotización
      table.decimal("total_price", 10, 2).notNullable();
      table.string("price_currency").defaultTo("ARS");
      table.text("description").notNullable();
      table.integer("estimated_hours");
      table.timestamp("estimated_start_date");
      table.timestamp("estimated_completion_date");

      // Estado de la cotización
      table
        .enum("status", [
          "pending", // Enviada, esperando respuesta del cliente
          "accepted", // Aceptada por el cliente
          "rejected", // Rechazada por el cliente
          "withdrawn", // Retirada por el profesional
          "expired", // Expirada por tiempo
        ])
        .defaultTo("pending");

      // Validez de la cotización
      table.timestamp("valid_until").notNullable();
      table.text("terms_and_conditions");
      table.boolean("includes_materials").defaultTo(false);
      table.text("materials_description");
      table.decimal("materials_cost", 10, 2).defaultTo(0);

      // Información adicional
      table.text("professional_notes");
      table.text("client_feedback"); // Si es rechazada, razón del cliente
      table.timestamp("responded_at");

      table.timestamps(true, true);

      table.index(["job_id"]);
      table.index(["professional_id"]);
      table.index(["status"]);
      table.index(["valid_until"]);
    })
    .createTable("job_messages", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("sender_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.enum("sender_type", ["client", "professional"]).notNullable();

      // Contenido del mensaje
      table.text("message");
      table
        .enum("message_type", ["text", "image", "location", "system"])
        .defaultTo("text");
      table.string("image_url"); // Si es tipo imagen
      table.decimal("location_lat", 10, 8); // Si es tipo ubicación
      table.decimal("location_lng", 11, 8);
      table.text("location_address");

      // Estado del mensaje
      table.boolean("is_read").defaultTo(false);
      table.timestamp("read_at");
      table.boolean("is_system_message").defaultTo(false); // Mensajes automáticos del sistema

      table.timestamps(true, true);

      table.index(["job_id"]);
      table.index(["sender_id"]);
      table.index(["is_read"]);
      table.index(["created_at"]);
    });
};
