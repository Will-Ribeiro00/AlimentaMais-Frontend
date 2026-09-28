const API_URL = 'https://alimenta-mais-fyfwggdtchamafe7.centralus-01.azurewebsites.net';

export async function login(email, password) {
  const response = await fetch(`${API_URL}/hlm/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!response.ok) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return await response.json();
}

export async function registrarUsuario(dados) {
  const response = await fetch(`${API_URL}/api/usuario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    throw new Error('Não foi possível realizar o cadastro.');
  }

  return await response.json();
}
