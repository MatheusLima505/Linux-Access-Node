import axios from "axios";
import { useEffect, useState } from "react";

function Home() {
    const [containers, setContainers] = useState([]); // Inicializa containers como um array vazio

    //remover containers
    const rmContainer = async (cont_id, cont_name) => {
        try {
            const userID=1
            const response=await axios.delete("http://localhost:5000/api/rmcontainer", {
                params: {cont_id,
                cont_name}
            });
        fetchContainers();
        } catch(error) {
            alert("Erro: " + (error.response?.data?.message || error.message))
        }
    }
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

    //Botão de criar container
    const criarContainer = async () => {
        try {
            const userID = 1
            const response = await axios.post("http://localhost:5000/api/createcontainer", {
                userID
            });

            alert("Container criado: " + response.data.containerId);
            fetchContainers();
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);


    return (
        <div>
            <div>
                <h1>Home</h1>
                <button onClick={criarContainer}>ADD</button>
            </div>
            <h2>Containers:</h2>
            <ul>
                {containers.map((container) => (
                    <li key={container.id}><a href={"http://localhost:"+container.container_port}> Nome: {container.container_name} | Status: {container.container_status}</a> <button>Renomear</button> <button onClick={() =>rmContainer(container.id,container.container_name)}>Excluir</button>  </li>
                ))}
            </ul>
        </div>
    );

}


export default Home;