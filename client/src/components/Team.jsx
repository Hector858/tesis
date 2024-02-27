import React from "react";

export const Team = (props) => {
  return (
    <div>
      <div id="team" className="text-center">
        <div className="container">
          <div className="col-md-8 col-md-offset-2 section-title">
            <h2>Equipo de trabajo</h2>
            <p>
              El desarrollo de la aplicación web Trackview estuvo a cargo de:
            </p>
          </div>
          <div>
            {props.data
              ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4 team">
                  <div className="thumbnail">
                    {" "}
                    <img src={d.img} alt="..." className="team-img" />
                    <div className="caption">
                      <h4>{d.name}</h4>
                      <p>{d.job}</p>
                    </div>
                  </div>
                </div>
              ))
              : "loading"}
          </div>
        </div>
      </div>
      <div id="footer">
        <div className="container text-center">
          <p>
            &copy; 2024 Derechos reservados a Solano Wilmer y Hector Cedeño{" "}
            {/* <a href="http://www.templatewire.com" rel="nofollow">
              TemplateWire
            </a> */}
          </p>
        </div>
      </div>
    </div>
  );
};
