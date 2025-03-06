import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { checkMember } from "../../middleware/member";

const QRCodeGenerator = () => {
  const [MemberData, setMemberData] = useState();

  useEffect(() => {
    checkMember(setMemberData);
  }, []);

  const referralLink = MemberData?.referralCode
    ? import.meta.env.VITE_URL+`/referral-verification?referral=${MemberData.referralCode}`
    : "";

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-md font-bold mb-4">Referral QR Code</h1>
      {referralLink ? (
        <QRCodeCanvas
          value={referralLink}
          size={200}
          bgColor="#ffffff"
          fgColor="#059669"
          level="H"
        />
      ) : (
        <p className="text-gray-500">No referral code available</p>
      )}
    </div>
  );
};

export default QRCodeGenerator;
