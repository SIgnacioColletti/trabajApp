/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("payments", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("job_id")
        .references("id")
        .inTable("jobs")
        .onDelete("RESTRICT");
      table
        .uuid("client_id")
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT");
      table
        .uuid("professional_id")
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT");

      // Información del pago
      table.string("payment_number").unique().notNullable(); // PAY-001, PAY-002, etc.
      table.decimal("total_amount", 10, 2).notNullable();
      table.decimal("professional_amount", 10, 2).notNullable(); // Monto que recibe el profesional
      table.decimal("platform_fee", 10, 2).notNullable(); // Comisión de la plataforma (8%)
      table.decimal("payment_processing_fee", 10, 2).defaultTo(0);
      table.string("currency").defaultTo("ARS");

      // Estado del pago
      table
        .enum("status", [
          "pending", // Pendiente de pago
          "processing", // Procesando pago
          "held", // Retenido (24hs después de completado)
          "completed", // Completado y liberado
          "refunded", // Reembolsado
          "disputed", // En disputa
          "failed", // Falló el procesamiento
        ])
        .defaultTo("pending");

      // Información del método de pago
      table
        .enum("payment_method", [
          "mercadopago",
          "transferencia",
          "efectivo",
          "tarjeta_credito",
          "tarjeta_debito",
        ])
        .notNullable();

      // IDs externos de procesadores de pago
      table.string("external_payment_id"); // ID de MercadoPago, etc.
      table.string("external_transaction_id");
      table.jsonb("payment_metadata").defaultTo("{}"); // Info adicional del processor

      // Fechas importantes
      table.timestamp("paid_at");
      table.timestamp("released_at"); // Cuando se libera el pago al profesional
      table.timestamp("expires_at"); // Cuando expira el link de pago

      // Información adicional
      table.text("failure_reason");
      table.text("dispute_reason");
      table.string("receipt_url"); // URL del comprobante

      table.timestamps(true, true);

      table.index(["job_id"]);
      table.index(["client_id"]);
      table.index(["professional_id"]);
      table.index(["status"]);
      table.index(["payment_method"]);
      table.index(["external_payment_id"]);
    })
    .createTable("reviews", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("reviewer_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .uuid("reviewee_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.enum("reviewer_type", ["client", "professional"]).notNullable();

      // Calificación general
      table.integer("rating").notNullable(); // 1-5 estrellas
      table.text("comment");

      // Calificaciones específicas (para profesionales)
      table.integer("quality_rating"); // Calidad del trabajo
      table.integer("punctuality_rating"); // Puntualidad
      table.integer("communication_rating"); // Comunicación
      table.integer("cleanliness_rating"); // Limpieza/orden
      table.integer("price_rating"); // Relación precio-calidad

      // Calificaciones específicas (para clientes)
      table.integer("payment_rating"); // Pago puntual
      table.integer("clarity_rating"); // Claridad en la descripción
      table.integer("availability_rating"); // Disponibilidad para coordinación

      // Estado y moderación
      table.boolean("is_public").defaultTo(true);
      table.boolean("is_featured").defaultTo(false); // Destacada en el perfil
      table
        .enum("moderation_status", ["pending", "approved", "rejected"])
        .defaultTo("approved");
      table.text("moderation_notes");
      table.timestamp("moderated_at");

      // Respuesta del profesional/cliente
      table.text("response"); // Respuesta a la reseña
      table.timestamp("responded_at");

      table.timestamps(true, true);

      // Una reseña por job por reviewer
      table.unique(["job_id", "reviewer_id"]);
      table.index(["reviewee_id"]);
      table.index(["reviewer_type"]);
      table.index(["rating"]);
      table.index(["is_public"]);
      table.index(["moderation_status"]);
    })
    .createTable("notifications", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");

      // Tipo y contenido
      table
        .enum("type", [
          "new_quotation", // Nueva cotización recibida
          "quotation_accepted", // Cotización aceptada
          "quotation_rejected", // Cotización rechazada
          "job_assigned", // Trabajo asignado
          "job_started", // Trabajo iniciado
          "job_completed", // Trabajo completado
          "payment_received", // Pago recibido
          "review_received", // Nueva reseña recibida
          "message_received", // Nuevo mensaje en chat
          "system_update", // Actualización del sistema
          "promotion", // Promoción o marketing
        ])
        .notNullable();

      table.string("title").notNullable();
      table.text("message").notNullable();
      table.string("action_url"); // URL a la que redirige al hacer clic

      // Referencias opcionales
      table.uuid("job_id").references("id").inTable("jobs").onDelete("CASCADE");
      table
        .uuid("quotation_id")
        .references("id")
        .inTable("quotations")
        .onDelete("CASCADE");
      table
        .uuid("review_id")
        .references("id")
        .inTable("reviews")
        .onDelete("CASCADE");

      // Estado
      table.boolean("is_read").defaultTo(false);
      table.timestamp("read_at");
      table.boolean("is_pushed").defaultTo(false); // Si se envió push notification
      table.timestamp("pushed_at");

      // Configuración
      table.integer("priority").defaultTo(3); // 1=alta, 3=normal, 5=baja
      table.timestamp("expires_at"); // Opcional, para notificaciones temporales

      table.timestamps(true, true);

      table.index(["user_id"]);
      table.index(["type"]);
      table.index(["is_read"]);
      table.index(["priority"]);
      table.index(["created_at"]);
    })
    .createTable("user_settings", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");

      // Configuraciones de notificaciones
      table.boolean("email_notifications").defaultTo(true);
      table.boolean("push_notifications").defaultTo(true);
      table.boolean("sms_notifications").defaultTo(false);

      // Configuraciones específicas por tipo
      table.boolean("notify_new_quotations").defaultTo(true);
      table.boolean("notify_job_updates").defaultTo(true);
      table.boolean("notify_messages").defaultTo(true);
      table.boolean("notify_payments").defaultTo(true);
      table.boolean("notify_reviews").defaultTo(true);
      table.boolean("notify_promotions").defaultTo(false);

      // Configuraciones de privacidad
      table.boolean("profile_public").defaultTo(true);
      table.boolean("show_phone").defaultTo(false);
      table.boolean("show_email").defaultTo(false);
      table.boolean("show_last_activity").defaultTo(true);

      // Configuraciones para profesionales
      table.boolean("auto_accept_quotations").defaultTo(false);
      table.integer("max_concurrent_jobs").defaultTo(5);
      table.jsonb("working_hours").defaultTo("{}"); // Horarios de trabajo
      table.boolean("accept_emergency_jobs").defaultTo(false);

      table.timestamps(true, true);

      table.unique(["user_id"]);
      table.index(["email_notifications"]);
      table.index(["push_notifications"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("user_settings")
    .dropTableIfExists("notifications")
    .dropTableIfExists("reviews")
    .dropTableIfExists("payments");
};
