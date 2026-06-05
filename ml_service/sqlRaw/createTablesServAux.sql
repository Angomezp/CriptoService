CREATE TABLE precios_criptomonedas (
    id BIGSERIAL PRIMARY KEY,

    simbolo VARCHAR(20) NOT NULL,

    fecha_hora TIMESTAMP NOT NULL,

    precio NUMERIC(20,8) NOT NULL,

    capitalizacion_mercado NUMERIC(30,2),

    volumen NUMERIC(30,2),

    CONSTRAINT uq_precio_criptomoneda
        UNIQUE (simbolo, fecha_hora)
);

CREATE INDEX idx_precio_simbolo
    ON precios_criptomonedas(simbolo);

CREATE INDEX idx_precio_simbolo_fecha
    ON precios_criptomonedas(simbolo, fecha_hora);


CREATE TABLE modelos (
    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    algoritmo VARCHAR(50) NOT NULL,

    version VARCHAR(20) NOT NULL,

    mae NUMERIC(15,6),

    rmse NUMERIC(15,6),

    observaciones INTEGER,

    fecha_entrenamiento TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);