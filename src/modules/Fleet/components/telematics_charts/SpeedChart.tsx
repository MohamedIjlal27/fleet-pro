import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

const SpeedChart: React.FC<{ speed: number }> = ({ speed }) => {
  return (
    <div className="flex flex-col items-center ml-4">
      <ReactSpeedometer
        value={speed}
        minValue={0}
        maxValue={200}
        needleColor="#0A1224"
        startColor="rgba(30, 41, 59, 0.2)"
        endColor="rgba(30, 41, 59, 1)"
        segments={1}
        needleTransitionDuration={2000}
        needleHeightRatio={0.7}
        ringWidth={37}
        currentValueText={`Speed: ${speed} km/h`}
        valueTextFontSize="12px"
        textColor="#000"
        width={182}
        height={150}
      />
    </div>
  );
};

export default SpeedChart;
