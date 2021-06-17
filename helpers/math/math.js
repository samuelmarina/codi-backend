/**
 * Obtener el porcentaje de una cantidad
 * específica
 * @param {Number} num cantidad a calcular
 * @param {Number} total cantidad total
 * @returns Número porcentual
 */
const getPercentage = (num, total) => {
    return (num * 100 / total).toFixed(2);
}

module.exports = {
    getPercentage
}