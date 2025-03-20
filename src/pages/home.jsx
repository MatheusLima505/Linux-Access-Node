import axios from "axios";


function Home() {

    //Botão de criar container
    const criarContainer = async () => {
        try {
            const userID = 1
            const response = await axios.post("http://localhost:5000/api/createcontainer", {
                userID
            });

            alert("Container criado: " + response.data.containerId);
        } catch (error) {
            alert("Erro: " + (error.response?.data?.message || error.message));
        }
    };


    return (
        <div>
            <h1>Home</h1>
            <button onClick={criarContainer}>ADD</button>
        </div>
    )

}


export default Home;