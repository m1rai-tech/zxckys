exports.seed = function(knex) {
  return knex('cars').del()
    .then(function () {
      return knex('cars').insert([
        {
          id: 1,
          vin: "3FA6P0RU3ER169003",
          make: "1949 Oldsmobile",
          model: "88",
          mileage: 5762,
          transmissionType: "manual",
          titleStatus: "clean"
        },
        {
          id: 2,
          vin: "YV4CZ852981463186",
          make: "1970 Plymouth",
          model: "Hemi Superbird",
          mileage: 2262,
          transmissionType: "automatic",
          titleStatus: "clean"
        },
        {
          id: 3,
          vin: "3N1AB7AP4EY335992",
          make: "1971 Ford",
          model: "Torino GT Convertible",
          mileage: 9762,
          transmissionType: "automatic",
          titleStatus: "clean"
        }
      ]);
    });
};