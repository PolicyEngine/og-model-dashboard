"""Runnable Python examples mirroring each step of the dashboard's Code tab.

The shared reform definition (Code-tab Step 2) lives in :mod:`og_dashboard.reform`
and is imported by every script under ``scripts/`` so each step can be run on
its own.
"""

from og_dashboard.reform import REFORM

__all__ = ["REFORM"]
