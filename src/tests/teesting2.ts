import InversionService from '../services/inversion.service.js';
import { Database } from '../config/database.js';

async function test() {
    await Database.getInstance().initialize();

    const inversionService = new InversionService();

    const resultado = await inversionService.getInversiones(
        'Criptos largo plazo',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc4MDk5MTgxMSwiZXhwIjoxNzgwOTk1NDExfQ.k5YQzM8U0CZVXfqDu97fdwmMA1OZSTjhA2LzJ6IaXPI'
    );

    console.log(resultado);
}

test().catch(console.error);
