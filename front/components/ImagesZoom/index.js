import React, { useState } from "react";
import PropTypes from "prop-types";
import Slick from "react-slick";
import {
  Global,
  Overlay,
  Header,
  CloseBtn,
  SlickWrapper,
  ImageWrapper,
  Indicator,
} from "./styles";

const ImagesZoom = ({ images, onClose }) => {
  const [currnetSlide, setCurrentSlide] = useState(0);

  return (
    <Overlay>
      <Global />
      <Header>
        <h1>상세 이미지</h1>
        <CloseBtn onClick={onClose} />
      </Header>
      <SlickWrapper>
        <div>
          <Slick
            initialSlide={0}
            afterChange={(slide) => setCurrentSlide(slide)}
            infinite
            arrows={false}
            slidesToShow={1}
            slidesToScroll={1}
          >
            {images.map((v) => (
              <ImageWrapper key={v.src}>
                <img src={`http://localhost:3065/${v.src}`} alt={v.src} />
              </ImageWrapper>
            ))}
          </Slick>
          <Indicator>
            <div>
              {currnetSlide + 1} / {images.length}
            </div>
          </Indicator>
        </div>
      </SlickWrapper>
    </Overlay>
  );
};

ImagesZoom.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImagesZoom;
