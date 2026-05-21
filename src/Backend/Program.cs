using Dapper;
using Microsoft.Data.SqlClient;
using Backend.Models;
using System.Data;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Agregar conexion para DB
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var conectionString = configuration.GetConnectionString("PokemonConection");
    return new SqlConnection(conectionString);
});
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy("AngularPolicy", policy =>
        {
            policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
    }
);
var app = builder.Build();
app.UseCors("AngularPolicy");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.MapGet("/pokemon", (IDbConnection db) =>
{
    // return "Pikachu, Bulbasaur, Charmander, Squirtle";
    return GetPokemons(db);
});

async Task<List<PokeCard>> GetPokemons(IDbConnection db)
{
    List<PokeCard> pokemons;
    pokemons = [];

    var sqlQuery = "SELECT * FROM Pokemon";
    var pokeDB = await db.QueryAsync<PokeCard>(sqlQuery);
    pokemons = pokeDB.ToList();
    // PokeCard bulbasaur = new PokeCard()
    // {
    //     Nombre = "Bulbasaur",
    //     PokedexNumber = 1,
    //     Imagen = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    //     Type =
    //         [
    //         new PokeType { Type = "Grass", Color = "#9bcc50" },
    //         new PokeType { Type = "Poison", Color = "#b97fc9" }
    //         ]
    // };
    // pokemons.Add(bulbasaur);

    return pokemons;
}

// app.MapGet("/pokemon/{id}");
// app.MapPut("/pokemon");
// app.MapDelete("/pokemon/{id}");


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
