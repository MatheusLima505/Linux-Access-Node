import axios from "axios";
import { useEffect, useState } from "react";
import styles from './Home.module.css';
import config from './config';

function Home() {
    const [containers, setContainers] = useState([]);
    const [editando, setEditando] = useState(null);
    const [novoNome, setNovoNome] = useState("");

    const userID = localStorage.getItem("userID");

    useEffect(() => {
        if (!userID) {
            alert("Usuário não autenticado. Redirecionando para o login...");
            window.location.href = `http://${config.publicIP}/login`;
        } else {
            fetchContainers();
        }
    }, []);

    const fetchContainers = async () => {
        try {
            const response = await axios.get(`http://${config.serverIP}/api/listcontainers`, {
                params: { userID }
            });
            setContainers(response.data);
        } catch (error) {
            alert("Erro ao buscar containers: " + (error.response?.data?.message || error.message));
        }
    };

    const criarContainer = async () => {
        try {
            await axios.post(`http://${config.serverIP}/api/createcontainer`, { userID });
            fetchContainers();
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message));
        }
    };

    const rmContainer = async (cont_id, cont_name) => {
        try {
            await axios.delete(`http://${config.serverIP}/api/rmcontainer`, {
                params: { cont_id, cont_name }
            });
            fetchContainers();
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message));
        }
    };

    const renameContainer = async (id, novoNome) => {
        try {
            await axios.post(`http://${config.serverIP}/api/renamecontainer`, {
                cont_id: id,
                cont_name: novoNome
            });
            fetchContainers();
        } catch (error) {
            alert("Erro ao renomear");
        }
    };

    const iniciarEdicao = (id, nomeAtual) => {
        setEditando(id);
        setNovoNome(nomeAtual);
    };

    const salvarNome = (id) => {
        setContainers(containers.map(container =>
            container.id === id ? { ...container, container_name: novoNome } : container
        ));
        renameContainer(id, novoNome);
        setEditando(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("userID");
        window.location.href = `http://${config.publicIP}/login`;
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2>Seus containers:</h2>
                <button className={styles.addBtn} onClick={criarContainer}>ADD</button>
                <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
            </div>
            <ul className={styles.containerList}>
                {containers.map((container) => (
                    <li key={container.id} className={styles.containerItem}>
                        <a
                            className={styles.containerLink}
                            href={`http://${config.publicIP.split(':')[0]}:${container.container_port}`}
                        >
                            Nome: {container.container_name}
                        </a>

                        {editando === container.id ? (
                            <>
                                <input
                                    className={styles.editInput}
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                />
                                <button className={styles.saveBtn} onClick={() => salvarNome(container.id)}>Salvar</button>
                                <button className={styles.cancelBtn} onClick={() => setEditando(null)}>Cancelar</button>
                            </>
                        ) : (
                            <button className={styles.renameBtn} onClick={() => iniciarEdicao(container.id, container.container_name)}>Renomear</button>
                        )}
                        <button className={styles.deleteBtn} onClick={() => rmContainer(container.id, container.container_name)}>Excluir</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Home;
