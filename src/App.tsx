import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import { useState } from "react";

ZoomMtg.showRecordFunction({show: true});
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function App() {
  const authEndpoint = "http://localhost:4000"; // http://localhost:4000
  //const sdkKey = "uWp8H062QzmDtC7uzfNGg";
  // SECURITY NOTE: SDK Secret removed from client-side code!
  // The signature should be generated securely on your backend server
  
  // 사용자 입력 상태 관리
  const [meetingNumber, setMeetingNumber] = useState("");
  const [passWord, setPassWord] = useState("");
  const [role, setRole] = useState(1); // 1 = Host (녹화 권한 필요) 0 = Participant
  
  const userName = "React Host"; // 호스트임을 명확히 표시
  const userEmail = ""; // 호스트 이메일을 설정하면 더 좋음
  const registrantToken = "";
  const zakToken = ""; // 호스트 권한을 위해 ZAK 토큰이 필요할 수 있음
  const leaveUrl = "http://localhost:5173";

  // 녹화 제어 함수들
  const startRecording = () => {
    console.log("🔴 Starting recording...");
    ZoomMtg.record({ 
      record: true,
      success: (result: unknown) => {
        console.log("✅ Recording started:", result);
        alert("녹화가 시작되었습니다!");
      },
      error: (error: unknown) => {
        console.error("❌ Recording start failed:", error);
        alert("녹화 시작에 실패했습니다. 계정 설정을 확인해주세요.");
      }
    });
  };

  const stopRecording = () => {
    console.log("⏹️ Stopping recording...");
    ZoomMtg.record({ 
      record: false,
      success: (result: unknown) => {
        console.log("✅ Recording stopped:", result);
        alert("녹화가 중지되었습니다!");
      },
      error: (error: unknown) => {
        console.error("❌ Recording stop failed:", error);
        alert("녹화 중지에 실패했습니다.");
      }
    });
  };


  const getSignature = async () => {
    // 유효성 검사
    if (!meetingNumber.trim()) {
      alert("미팅 번호를 입력해주세요.");
      return;
    }
    
    if (meetingNumber.length < 9) {
      alert("올바른 미팅 번호를 입력해주세요 (9자리 이상).");
      return;
    }
    
    try {
      console.log("Requesting signature for meeting:", meetingNumber, "with role:", role);
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role,
        }),
      });
      const res = await req.json()
      const signature = res.signature as string;
      const sdkKey = res.sdkKey as string;
      console.log("Signature received:", signature);
      console.log("SDK Key received:", sdkKey);
      startMeeting(signature, sdkKey);
    } catch (e) {
      console.error("Error getting signature:", e);
      alert("서명을 받아오는 중 오류가 발생했습니다. 서버를 확인해주세요.");
    }
  };

  function startMeeting(signature: string, sdkKey: string) {
    console.log("Starting meeting with configuration:", {
      meetingNumber,
      role: role === 1 ? "Host" : "Participant",
      userName,
      hasPassword: passWord ? "Yes" : "No"
    });
    
    document.getElementById("zmmtg-root")!.style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      disableRecord: false, // 녹화 기능 활성화 (가장 중요!)
      disableJoinAudio: false, // 오디오 참가 허용
      audioPanelAlwaysOpen: false, // 오디오 패널 제어
      showMeetingHeader: true, // 미팅 헤더 표시
      disableInvite: false, // 초대 기능 활성화
      disableCallOut: false, // 전화 걸기 기능 활성화
      meetingInfo: [
        'topic',
        'host',
        'mn',
        'pwd',
        'telPwd',
        'invite',
        'participant',
        'dc',
        'enctype',
        'report'
      ],
      success: (success: unknown) => {
        console.log("ZoomMtg.init success:", success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,
          success: (success: unknown) => {
            console.log("ZoomMtg.join success:", success);
            console.log("Successfully joined as:", role === 1 ? "Host" : "Participant");
            
          },
          error: (error: unknown) => {
            console.error("ZoomMtg.join error:", error);
          },
        });
      },
      error: (error: unknown) => {
        console.error("ZoomMtg.init error:", error);
      },
    });
  }

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>
        
        {/* 미팅 설정 입력 폼 */}
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h3>미팅 설정</h3>
          
          {/* 미팅 번호 입력 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              미팅 번호:
            </label>
            <input
              type="text"
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(e.target.value)}
              placeholder="미팅 번호를 입력하세요"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              미팅 비밀번호:
            </label>
            <input
              type="text"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
              placeholder="비밀번호를 입력하세요 (선택사항)"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          {/* 역할 선택 (라디오 버튼) */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              참가 역할:
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value={1}
                  checked={role === 1}
                  onChange={(e) => setRole(parseInt(e.target.value))}
                  style={{ marginRight: '5px' }}
                />
                👑 호스트 (녹화 권한 있음)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value={0}
                  checked={role === 0}
                  onChange={(e) => setRole(parseInt(e.target.value))}
                  style={{ marginRight: '5px' }}
                />
                👤 참가자
              </label>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={getSignature}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Join Meeting
          </button>
        </div>
        
        {/* 녹화 제어 버튼들 */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={startRecording}
            disabled={role !== 1}
            style={{ 
              backgroundColor: role === 1 ? '#dc3545' : '#ccc', 
              color: 'white', 
              marginRight: '10px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: role === 1 ? 'pointer' : 'not-allowed',
              opacity: role === 1 ? 1 : 0.6
            }}
          >
            🔴 녹화 시작 {role !== 1 && '(호스트만 가능)'}
          </button>
          <button 
            onClick={stopRecording}
            disabled={role !== 1}
            style={{ 
              backgroundColor: role === 1 ? '#6c757d' : '#ccc', 
              color: 'white', 
              marginRight: '10px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: role === 1 ? 'pointer' : 'not-allowed',
              opacity: role === 1 ? 1 : 0.6
            }}
          >
            ⏹️ 녹화 중지 {role !== 1 && '(호스트만 가능)'}
          </button>
        </div>
        

        
        <div style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '20px',
          textAlign: 'left',
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '5px'
        }}>
          <h3>사용 방법:</h3>
          <p>1. 위의 폼에서 미팅 번호, 비밀번호, 역할을 설정하세요</p>
          <p>2. "Join Meeting" 버튼을 클릭하여 미팅에 참가하세요</p>
          <p>3. 호스트 역할로 참가한 경우 "� 녹화 시작" 버튼을 사용할 수 있습니다</p>
          <p>4. 미팅 화면 하단의 녹화 버튼도 사용할 수 있습니다</p>
          <p>5. 녹화가 안 되면 Zoom 계정 설정 → 녹화 권한을 확인하세요</p>
          <p>6. 콘솔 로그를 확인하여 오류 메시지를 확인하세요</p>
          
          <h4 style={{ marginTop: '15px' }}>현재 설정:</h4>
          <p>• 미팅 번호: {meetingNumber || '입력되지 않음'}</p>
          <p>• 비밀번호: {passWord || '없음'}</p>
          <p>• 역할: {role === 1 ? '👑 호스트' : '👤 참가자'}</p>
        </div>
      </main>
    </div>
  );
}

export default App;

