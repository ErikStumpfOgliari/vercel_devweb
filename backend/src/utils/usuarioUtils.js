/**
 * Frontend envia Cliente | Dono; o banco usa cliente | dono.
 */
export function normalizarTipoUsuario(tipoRaw) {
  if (!tipoRaw || typeof tipoRaw !== 'string') return null;
  const key = tipoRaw.trim().toLowerCase();
  if (key === 'cliente') return 'cliente';
  if (key === 'dono') return 'dono';
  return null;
}

export function sanitizarUsuario(instanciaOuJson) {
  const dados =
    typeof instanciaOuJson?.toJSON === 'function'
      ? instanciaOuJson.toJSON()
      : { ...instanciaOuJson };
  const { senha: _omitida, password: __omitida, ...resto } = dados;
  return resto;
}
