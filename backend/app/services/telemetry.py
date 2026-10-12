"""
Telemetry Service and Normalization Interface for EVORA.
Provides normalize_telemetry for standardizing raw external telemetry packets.
"""

from typing import Dict, Any, Tuple, List, Union
from app.services.normalization import (
    FeatureNormalizer,
    FIELD_ALIAS_MAP,
    REQUIRED_MODEL_FEATURES,
)


def normalize_telemetry(
    raw_data: Dict[str, Any],
    return_warnings: bool = False
) -> Union[Dict[str, Any], Tuple[Dict[str, Any], List[str]]]:
    """
    Normalizes a raw telemetry packet into the standardized EVORA application schema.

    Parameters:
        raw_data: Raw input dictionary containing telemetry keys (aliases, varying units).
        return_warnings: If True, returns a tuple of (normalized_data, warnings).
                         If False (default), returns normalized_data dict directly.

    Returns:
        Dict[str, Any] normalized telemetry, or (Dict[str, Any], List[str]) if return_warnings is True.
    """
    if not isinstance(raw_data, dict):
        raise TypeError(f"raw_data must be a dictionary, got {type(raw_data).__name__}")

    normalized, warnings = FeatureNormalizer.normalize_telemetry_packet(raw_data)

    if return_warnings:
        return normalized, warnings
    return normalized


__all__ = ["normalize_telemetry", "FIELD_ALIAS_MAP", "REQUIRED_MODEL_FEATURES"]
