from fastapi import FastAPI
from fastapi.responses import JSONResponse
import subprocess

app = FastAPI()

@app.post("/api/runscript")
async def run_full_script():
    try:
        # Run the Python script
        result = subprocess.run(['python', 'C:/safetybackupcode/cvanalyzer/my-app/app.py'], capture_output=True, text=True)

        if result.returncode != 0:
            return JSONResponse(status_code=500, content={"error": f"Script execution failed: {result.stderr}"})

        return {"message": "Script executed successfully", "output": result.stdout}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
