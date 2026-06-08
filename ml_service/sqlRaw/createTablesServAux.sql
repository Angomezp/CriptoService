CREATE TABLE crypto_prices (
    id BIGSERIAL PRIMARY KEY,

    symbol VARCHAR(20) NOT NULL,

    time_stamp TIMESTAMP NOT NULL,

    price NUMERIC(20,8) NOT NULL,

    market_cap NUMERIC(30,2),

    volume_24h NUMERIC(30,2),

    CONSTRAINT uq_symbol_time_stamp
        UNIQUE (symbol, time_stamp)
);

CREATE INDEX idx_price_symbol
    ON crypto_prices(symbol);

CREATE INDEX idx_price_symbol_time_stamp
    ON crypto_prices(symbol, time_stamp);


CREATE TABLE models_metadata (
    id SERIAL PRIMARY KEY,

    model_name VARCHAR(100) NOT NULL,

    model_algorithm VARCHAR(50) NOT NULL,

    model_version VARCHAR(20) NOT NULL,

    mae NUMERIC(15,6),

    rmse NUMERIC(15,6),

    observations INTEGER,

    model_path VARCHAR(255) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT FALSE,

    symbol VARCHAR(20) NOT NULL,

    training_date TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_model_metadata_active
    ON models_metadata(active);

CREATE INDEX idx_model_metadata_symbol_active
    ON models_metadata(symbol, active);