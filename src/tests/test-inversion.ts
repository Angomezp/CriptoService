import InversionService from '../services/inversion.service.js';

const service = new InversionService();

async function test() {
    try {
        const result = await service.createInversion(
            "Criptos largo plazo",
            "bitcoin",
            0.01,
            "TU_TOKEN_AQUI"
        );

        console.log("RESULTADO:", result);
    } catch (err) {
        console.error("ERROR:", err);
    }
}

test();