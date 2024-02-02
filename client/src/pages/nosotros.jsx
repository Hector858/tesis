import React from "react";
import "./card.css";
import image1 from "../assets/yo.jpg";
import image2 from "../assets/wilmer.jpeg";

const Nosotros = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-5 mx-auto">
                    <div class="card text-center animate__animated animate__fadeInUp" style={{ backgroundColor: 'rgba(7, 21, 56, 1)' }}>
                        <div class="overflow">
                        <img src={image1} alt="a wallpaper" class="card-img-top" />
                        </div>
                        <div class="card-body text-light">
                            <h4 class="card-title">Hector Ismael Cedeño Zambrano</h4>
                            <p class="card-text text-secondary">
                            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magnam deserunt fuga accusantium excepturi quia, voluptates obcaecati nam in voluptas perferendis velit harum dignissimos quasi ex? Tempore repellat quo doloribus magnam."
                            </p>
                            <a href="https://github.com/Hector858" target="_blank" class="btn btn-outline-secondary border-0" rel="noreferrer">
                            Go to Hector Cedeño
                            </a>
                        </div>
                    </div>
                </div>
                <div className="col-md-5 mx-auto">
                    <div class="card text-center animate__animated animate__fadeInUp" style={{ backgroundColor: 'rgba(7, 21, 56, 1)' }}>
                        <div class="overflow">
                        <img src={image2} alt="a wallpaper" class="card-img-top" />
                        </div>
                        <div class="card-body text-light">
                            <h4 class="card-title">Wilmer José Solano Llano</h4>
                            <p class="card-text text-secondary">
                            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magnam deserunt fuga accusantium excepturi quia, voluptates obcaecati nam in voluptas perferendis velit harum dignissimos quasi ex? Tempore repellat quo doloribus magnam."
                            </p>
                            <a href="https://github.com/Hector858" target="_blank" class="btn btn-outline-secondary border-0" rel="noreferrer">
                            Go to Wilmer Solano
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>        
  );
}

export default Nosotros;