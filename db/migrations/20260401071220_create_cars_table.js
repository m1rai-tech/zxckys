exports.up = function(knex) {
  return knex.schema.createTable('cars', table => {
    table.increments('id').primary();
    table.string('vin');
    table.string('make');
    table.string('model');
    table.integer('mileage');
    table.string('transmissionType');
    table.string('titleStatus');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cars');
};