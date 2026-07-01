SELECT TOP (1000)
    [TypeId]
      , [Type]
      , [Color]
FROM [PokemonesDB].[dbo].[Type]

INSERT INTO [Type]
SELECT 1, 'RAYO', '#FFF123'
INSERT INTO [Type]
SELECT 2, 'FUEGO', '#FF0000'
INSERT INTO [Type]
SELECT 3, 'AGUA', '#0000FF'

INSERT INTO [PokemonTypes]
SELECT 25, 1
INSERT INTO [PokemonTypes]
SELECT 25, 2

SELECT *
FROM PokemonTypes

SELECT p.PokedexNumber, p.Nombre, t.TypeId, t.Type
FROM Pokemon p
    LEFT JOIN PokemonTypes pt ON p.PokedexNumber = pt.PokedexNumber
    LEFT JOIN Type t ON pt.TypeId = t.TypeId


/*
INSERT INTO USERS Select 'admin', 'Admin123'
*/

select * from USERS
