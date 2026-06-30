USE [PokemonesDB];
GO

IF OBJECT_ID(N'dbo.Pokemon', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pokemon
    (
        PokedexNumber INT NOT NULL,
        Nombre NVARCHAR(30) NULL,
        Imagen NVARCHAR(200) NULL,
        CONSTRAINT PK_Pokemon PRIMARY KEY CLUSTERED (PokedexNumber)
    );
END;
GO

IF OBJECT_ID(N'dbo.[Type]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[Type]
    (
        TypeId INT NOT NULL,
        [Type] NVARCHAR(200) NULL,
        Color VARCHAR(7) NULL,
        CONSTRAINT PK_Type PRIMARY KEY CLUSTERED (TypeId)
    );
END;
GO

IF OBJECT_ID(N'dbo.PokemonTypes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PokemonTypes
    (
        PokedexNumber INT NOT NULL,
        TypeId INT NOT NULL,
        CONSTRAINT PK_PokemonTypes PRIMARY KEY CLUSTERED (PokedexNumber, TypeId)
    );
END;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId INT IDENTITY(1,1) NOT NULL,
        [User] NVARCHAR(50) NOT NULL,
        [Password] NVARCHAR(250) NOT NULL,
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Pokemon)
BEGIN
:r /seed/SeedPokemons.sql
END;
GO

MERGE dbo.[Type] AS target
USING
(
    VALUES
        (1, N'RAYO', '#FFF123'),
        (2, N'FUEGO', '#FF0000'),
        (3, N'AGUA', '#0000FF')
) AS source (TypeId, [Type], Color)
ON target.TypeId = source.TypeId
WHEN NOT MATCHED THEN
    INSERT (TypeId, [Type], Color)
    VALUES (source.TypeId, source.[Type], source.Color);
GO

MERGE dbo.PokemonTypes AS target
USING
(
    VALUES
        (25, 1),
        (25, 2)
) AS source (PokedexNumber, TypeId)
ON target.PokedexNumber = source.PokedexNumber
   AND target.TypeId = source.TypeId
WHEN NOT MATCHED THEN
    INSERT (PokedexNumber, TypeId)
    VALUES (source.PokedexNumber, source.TypeId);
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.Users
    WHERE [User] = N'$(InitialAdminUser)'
)
BEGIN
    INSERT INTO dbo.Users ([User], [Password])
    VALUES (N'$(InitialAdminUser)', N'$(InitialAdminPassword)');
END;
GO
