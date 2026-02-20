from db_logger import log_fault

result = log_fault(
    fault_type="Pressure Drop",
    mean_error=0.055,
    max_error=0.14,
    sensor="P12",
    severity="High"
)

print(result)