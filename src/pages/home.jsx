import axios from "axios";
import { useEffect, useState } from "react";
import styles from './Home.module.css'

function Home() {
    const [containers, setContainers] = useState([]); // Inicializa containers como um array vazio

    //listar containers
    const fetchContainers = async () => {
        try {
            const userID = 1
            const response = await axios.get("http://localhost:5000/api/listcontainers?userID=1", { userID });
            console.log((response.data))
            setContainers(response.data);
        } catch (error) {
            alert("Erro ao buscar containers: " + (error.response?.data?.message || error.message));
        }
    };


    //remover containers
    const rmContainer = async (cont_id, cont_name) => {
        try {
            const userID = 1
            const response = await axios.delete("http://localhost:5000/api/rmcontainer", {
                params: {
                    cont_id,
                    cont_name
                }
            });
            fetchContainers();
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message))
        }
    }

    //Botão de criar container
    const criarContainer = async () => {
        try {
            const userID = 1
            const response = await axios.post("http://localhost:5000/api/createcontainer", {
                userID
            });
            fetchContainers();
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message));
        }
    };
    //renomear container
    const [editando, setEditando] = useState(null);
    const [novoNome, setNovoNome] = useState("");

    const renameContainer = async (id, novoNome) => {
        try {
            const response = await axios.post("http://localhost:5000/api/renamecontainer", {
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
    useEffect(() => {
        fetchContainers();
    }, []);


    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2>Seus containers:</h2>
                <button className={styles.addBtn} onClick={criarContainer}>ADD</button>
            </div>
            <ul className={styles.containerList}>
                {containers.map((container) => (
                    <li key={container.id} className={styles.containerItem}>
                        <a
                            className={styles.containerLink}
                            href={`http://localhost:${container.container_port}`}
                        >
                            Nome: {container.container_name} | Status: {container.container_status}
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