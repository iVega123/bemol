/* eslint-disable react-hooks/rules-of-hooks */
import Head from 'next/head';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  styled,
  Button,
  CircularProgress,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import { IMaskInput } from 'react-imask';
import Footer from 'src/components/Footer';

import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { RefCallback, SetStateAction, useState } from 'react';
import React from 'react';
import Lock from '@mui/icons-material/Lock';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00000-000"
        definitions={{
          '#': /[1-9]/
        }}
        inputRef={ref as RefCallback<HTMLTextAreaElement | HTMLInputElement>}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);
const MainContent = styled(Box)(
  () => `
        height: 100%;
        display: flex;
        flex: 1;
    `
);

const TopWrapper = styled(Box)(
  ({ theme }) => `
      display: flex;
      width: 100%;
      flex: 1;
      align-items: center;
      justify-content: center;
      padding: ${theme.spacing(6)};
    `
);
const temNumero = (SenhaValue) => {
  return new RegExp(/[0-9]/).test(SenhaValue);
};
const letrasMaioreseMenores = (SenhaValue) => {
  return (
    new RegExp(/[a-z]/).test(SenhaValue) && new RegExp(/[A-Z]/).test(SenhaValue)
  );
};
const temCaractereEspecial = (SenhaValue) => {
  return new RegExp(/[!#@$%^&*)(+=._-]/).test(SenhaValue);
};
function forcadaSenha(SenhaValue) {
  let forca = 0;
  if (SenhaValue.length > 5) forca++;
  if (SenhaValue.length > 7) forca++;
  if (temNumero(SenhaValue)) forca++;
  if (temCaractereEspecial(SenhaValue)) forca++;
  if (letrasMaioreseMenores(SenhaValue)) forca++;
  return forca;
}
function indicadorSenha(forca) {
  if (forca < 2) return 'red';
  if (forca < 3) return 'yellow';
  if (forca < 4) return 'orange';
  if (forca < 5) return 'lightgreen';
  if (forca < 6) return 'green';
}
function indicadorForca(forca) {
  if (forca < 2) return 'Muito Fraca';
  if (forca < 3) return 'Fraca';
  if (forca < 4) return 'Ok';
  if (forca < 5) return 'Forte';
  if (forca < 6) return 'Muito Forte';
}
export function SignIn() {
  var [SenhaValue, setSenhaValue] = useState('');

  var [SenhaRValue, setSenhaRValue] = useState('');

  let forcaSenha = forcadaSenha(SenhaValue);

  let indicadordaSenha = indicadorSenha(forcaSenha);
  let indicadorforca = indicadorForca(forcaSenha);

  const [cep, setCep] = useState('');

  const [bairro, setBairro] = useState('');

  const [logradouro, setLogradouro] = useState('');

  const [complemento, setComplemento] = useState('');

  const [localidade, setLocalidade] = useState('');

  const [uf, setUf] = useState('');

  const [loading, setLoading] = useState(false);

  const [login, setLogin] = useState('');

  const handleAuthorizationCep = (value: string): boolean => {
    if (value.length <= 8) {
      return true;
    }
    return false;
  };

  const handleAuthorizationSubmit = (): boolean => {
    if (
      login.length > 0 &&
      localidade.length > 0 &&
      SenhaRValue === SenhaValue &&
      forcaSenha < 6
    ) {
      return false;
    } else {
      return true;
    }
  };

  const handleRegister = async () => {
    const query = `
    mutation CreateOneUser($data: UserCreateInput!) {
      createOneUser(data: $data) {
        email
        name
        password
        addresses {
          Logradouro
          Cep
          Bairro
          Localidade
          uf
        }
      }
    }`;

    const variables = {
      data: {
        email: login,
        name: login,
        password: SenhaValue,
        addresses: {
          create: {
            Logradouro: logradouro,
            Cep: parseInt(cep.substring(6)),
            Bairro: bairro,
            Localidade: localidade,
            uf: uf
          }
        }
      }
    };
    const id = toast.loading('Enviando Solicitação...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/graphql`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ query, variables })
    });
    console.log(res);
    if (res.ok) {
      toast.update(id, {
        render: 'Usuario Criado!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true
      });
    } else {
      toast.update(id, {
        render: 'Erro ao criar o Usuario',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true
      });
    }
  };

  const handleCepPopulate = async () => {
    const query = `
    query Query($cep: String!) {
      GetCep(cep: $cep) {
        cep
        logradouro
        complemento
        bairro
        localidade
        uf
      }
    }`;

    const variables = {
      cep: cep
    };
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_HOST}/graphql`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ query, variables })
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.erros) {
          toast.error('Cep Invalido', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });
        }
        setComplemento(result.data.GetCep.complemento);
        setLogradouro(result.data.GetCep.logradouro);
        setBairro(result.data.GetCep.bairro);
        setLocalidade(result.data.GetCep.localidade);
        setUf(result.data.GetCep.uf);
        setLoading(false);
      });
  };
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <MainContent>
        <TopWrapper>
          <Container maxWidth="sm">
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="stretch"
              spacing={4}
            >
              <Grid
                item
                xs={12}
                justifyContent="center"
                alignItems="stretch"
                textAlign="center"
              >
                <Card>
                  <CardHeader title="Sign In" />
                  <Divider />
                  <CardContent>
                    <Box
                      component="form"
                      sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' }
                      }}
                      noValidate
                      autoComplete="off"
                    >
                      <Grid>
                        <TextField
                          required
                          id="login"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          label="Login"
                        />
                      </Grid>
                      <Grid>
                        <OutlinedInput
                          autoComplete="off"
                          id="password"
                          style={{
                            maxWidth: '220px',
                            marginTop: '10px',
                            marginBottom: '10px'
                          }}
                          type="password"
                          placeholder="Password"
                          value={SenhaValue}
                          onChange={(e) => setSenhaValue(e.target.value)}
                          startAdornment={
                            <InputAdornment position="start">
                              <Lock />
                            </InputAdornment>
                          }
                        />
                        {SenhaValue !== '' ? (
                          <Box
                            fontStyle="italic"
                            fontSize="1rem"
                            marginBottom=".5rem"
                          >
                            <Box component="small" fontSize="80%">
                              Força da Senha:{' '}
                              <Box
                                component="span"
                                fontWeight="700"
                                color={indicadordaSenha}
                              >
                                {indicadorforca}
                              </Box>
                            </Box>
                          </Box>
                        ) : null}
                      </Grid>
                      <Grid>
                        <TextField
                          required
                          id="repeat-password"
                          label="Repeat Password"
                          type="password"
                          autoComplete="current-password"
                          value={SenhaRValue}
                          onChange={(e: {
                            target: { value: SetStateAction<string> };
                          }) => setSenhaRValue(e.target.value)}
                        />
                      </Grid>
                      <Grid container justifyContent={'center'}>
                        <Grid sx={{ ml: 10.5 }}>
                          <OutlinedInput
                            style={{ maxWidth: '220px', marginTop: '10px' }}
                            required
                            id="outlined-required"
                            value={cep}
                            placeholder={'Cep *'}
                            onChange={(e: {
                              target: { value: SetStateAction<string> };
                            }) => setCep(e.target.value)}
                            inputComponent={TextMaskCustom as any}
                          />
                        </Grid>
                        <Grid>
                          {!loading ? (
                            <Button
                              onClick={() => handleCepPopulate()}
                              variant="contained"
                              sx={{ ml: 1, mr: 1, mt: 1.5, mb: 4 }}
                              disabled={handleAuthorizationCep(cep)}
                            >
                              Verify
                            </Button>
                          ) : (
                            <CircularProgress
                              sx={{ ml: 5, mr: 1, mt: 1.5, mb: 4 }}
                              size={40}
                            />
                          )}
                        </Grid>
                      </Grid>
                      <Divider />
                      <CardHeader title="Address" />
                      <Grid container justifyContent={'center'}>
                        <Grid>
                          <TextField
                            id="logradouro"
                            label="Logradouro"
                            value={logradouro}
                            disabled={true}
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            id="complemento"
                            label="Complemento"
                            value={complemento}
                            disabled={true}
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            id="bairro"
                            label="Bairro"
                            value={bairro}
                            disabled={true}
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            id="localidade"
                            label="Localidade"
                            value={localidade}
                            disabled={true}
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            id="uf"
                            label="UF"
                            value={uf}
                            disabled={true}
                          />
                        </Grid>
                      </Grid>
                      <Divider />
                      <Grid>
                        <Button
                          onClick={handleRegister}
                          disabled={handleAuthorizationSubmit()}
                          variant="contained"
                          sx={{ mt: 1.5, mb: 0 }}
                        >
                          Create User
                        </Button>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </TopWrapper>
      </MainContent>
      <Footer />
    </>
  );
}

export default SignIn;
