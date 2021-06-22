/**
 * Obtener la fecha actual
 * @returns String fecha en formato dd/mm/yyyy
 */
const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
}

/**
 * Obtener la fecha actual
 * @returns String con la fecha y hora actual
 */
const getTimestamp = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const hh = today.getHours();
    const mins = today.getMinutes();
    const ss = today.getSeconds();
    const ms = today.getMilliseconds();

    const date = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mins + ":" + ss + "." + ms;

    return date;
}

module.exports = {
    getDate,
    getTimestamp
}