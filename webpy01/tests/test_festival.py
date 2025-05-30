from src.python.festival import festival
from src.python.festival import FESTIVAL_WESTERN

from datetime import date
import pytest

# List of festivals
western_festival_dates = [
    date(2011, 4, 24),
    date(2012, 4, 8),
    date(2013, 3, 31),
    date(2014, 4, 20),
    date(2015, 4, 5),
    date(2016, 3, 27),
    date(2017, 4, 16)
]

@pytest.mark.parametrize("festival_date", western_festival_dates)
def test_festival_western(festival_date):
	assert festival_date == festival(festival_date.year, FESTIVAL_WESTERN)

def test_festival_bad_method():
	with pytest.raises(ValueError):
		festival(1975, 4)
