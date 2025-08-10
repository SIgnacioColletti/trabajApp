/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("email").unique().notNullable();
      table.string("password_hash").notNullable();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.string("phone").unique();
      table.enum("user_type", ["client", "professional"]).notNullable();
      table.string("profile_image_url");
      table.text("address");
      table.decimal("latitude", 10, 8);
      table.decimal("longitude", 11, 8);
      table.string("city").defaultTo("Rosario");
      table.string("province").defaultTo("Santa Fe");
      table.string("country").defaultTo("Argentina");
      table.boolean("is_active").defaultTo(true);
      table.boolean("is_verified").defaultTo(false);
      table.string("verification_token");
      table.timestamp("email_verified_at");
      table.timestamp("phone_verified_at");
      table.decimal("rating_avg", 3, 2).defaultTo(0);
      table.integer("rating_count").defaultTo(0);
      table.jsonb("preferences").defaultTo("{}");
      table.timestamp("last_login");
      table.timestamps(true, true);

      // Índices para optimizar consultas
      table.index(["email"]);
      table.index(["phone"]);
      table.index(["user_type"]);
      table.index(["is_active"]);
      table.index(["city"]);
      table.index(["latitude", "longitude"]);
    })
    .createTable("user_tokens", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("token_hash").notNullable();
      table
        .enum("token_type", [
          "email_verification",
          "password_reset",
          "phone_verification",
        ])
        .notNullable();
      table.timestamp("expires_at").notNullable();
      table.boolean("is_used").defaultTo(false);
      table.timestamps(true, true);

      table.index(["user_id"]);
      table.index(["token_type"]);
      table.index(["expires_at"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("user_tokens")
    .dropTableIfExists("users");
};
